from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

from database import get_db
from models.transaction import Transaction
from models.account import Account

router = APIRouter(prefix="/transactions", tags=["transactions"])

# Pydantic schemas
class TransactionCreate(BaseModel):
    date: datetime
    description: str
    transaction_type: str
    category: str
    amount: float
    account_id: int

class TransactionResponse(BaseModel):
    id: int
    date: datetime
    description: str
    transaction_type: str
    category: str
    amount: float
    account_id: int
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    month: Optional[int] = Query(None, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, description="Filter by year"),
    transaction_type: Optional[str] = Query(None, description="Filter by type (entrada/saida)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    account_id: Optional[int] = Query(None, description="Filter by account"),
    min_amount: Optional[float] = Query(None, description="Minimum amount value"),
    max_amount: Optional[float] = Query(None, description="Maximum amount value"),
    db: Session = Depends(get_db)
):
    """Get transactions with optional filters"""
    query = db.query(Transaction)
    
    if month:
        query = query.filter(func.extract('month', Transaction.date) == month)
    if year:
        query = query.filter(func.extract('year', Transaction.date) == year)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category:
        query = query.filter(Transaction.category == category)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
    
    transactions = query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    return transactions

@router.post("/", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Create a new transaction"""
    # Verify account exists
    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    
    # Update account balance
    if transaction.transaction_type == "entrada":
        account.balance += transaction.amount
    else:
        account.balance -= transaction.amount
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/monthly", response_model=dict)
async def get_monthly_summary(
    year: int = Query(..., description="Year for summary"),
    db: Session = Depends(get_db)
):
    """Get monthly transaction summary"""
    transactions = db.query(Transaction).filter(
        db.extract('year', Transaction.date) == year
    ).all()
    
    monthly_summary = {}
    for transaction in transactions:
        month = transaction.date.month
        if month not in monthly_summary:
            monthly_summary[month] = {
                "entrada": 0,
                "saida": 0,
                "total": 0,
                "count": 0
            }
        
        if transaction.transaction_type == "entrada":
            monthly_summary[month]["entrada"] += transaction.amount
        else:
            monthly_summary[month]["saida"] += transaction.amount
            
        monthly_summary[month]["count"] += 1
    
    # Calculate totals
    for month_data in monthly_summary.values():
        month_data["total"] = month_data["entrada"] - month_data["saida"]
    
    return monthly_summary 

@router.delete("/{transaction_id}", response_model=TransactionResponse)
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction"""
    # Get transaction
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get account to update balance
    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Update account balance
    if transaction.transaction_type == "entrada":
        account.balance -= transaction.amount
    else:
        account.balance += transaction.amount
    
    # Delete transaction
    db.delete(transaction)
    db.commit()
    
    return transaction 

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int, 
    transaction_update: TransactionCreate, 
    db: Session = Depends(get_db)
):
    """Update a transaction"""
    # Get transaction
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get account to update balance
    old_account = db.query(Account).filter(Account.id == transaction.account_id).first()
    new_account = db.query(Account).filter(Account.id == transaction_update.account_id).first()
    
    if not old_account or not new_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Revert old transaction effect on old account
    if transaction.transaction_type == "entrada":
        old_account.balance -= transaction.amount
    else:
        old_account.balance += transaction.amount
    
    # Apply new transaction effect on new account
    if transaction_update.transaction_type == "entrada":
        new_account.balance += transaction_update.amount
    else:
        new_account.balance -= transaction_update.amount
    
    # Update transaction
    for field, value in transaction_update.dict().items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    return transaction 