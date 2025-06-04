from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import create_tables, engine, get_db
from models.account import Account
from models.transaction import Transaction
from routers import transactions, accounts
from sqlalchemy.orm import sessionmaker, Session
import json
from datetime import datetime

# Create FastAPI app
app = FastAPI(
    title="Financial Dashboard API",
    description="API para dashboard financeiro pessoal",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(transactions.router)
app.include_router(accounts.router)

@app.on_event("startup")
async def startup_event():
    """Initialize database and create default accounts"""
    create_tables()
    
    # Create default accounts if they don't exist
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if accounts already exist
        existing_accounts = db.query(Account).count()
        
        if existing_accounts == 0:
            # Create 3 default accounts
            default_accounts = [
                Account(name="Conta Corrente", balance=0.0),
                Account(name="Conta Poupança", balance=0.0),
                Account(name="Carteira", balance=0.0)
            ]
            
            for account in default_accounts:
                db.add(account)
            
            db.commit()
            print("✅ Default accounts created successfully!")
        else:
            print(f"✅ Database already has {existing_accounts} accounts")
            
    except Exception as e:
        print(f"❌ Error creating default accounts: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/")
async def root():
    return {
        "message": "Financial Dashboard API", 
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "financial-dashboard-api"}

@app.get("/export")
async def export_database(db: Session = Depends(get_db)):
    """Export complete database in JSON format"""
    try:
        # Get all accounts
        accounts = db.query(Account).all()
        accounts_data = []
        for account in accounts:
            accounts_data.append({
                "id": account.id,
                "name": account.name,
                "balance": account.balance
            })
        
        # Get all transactions
        transactions = db.query(Transaction).all()
        transactions_data = []
        for transaction in transactions:
            transactions_data.append({
                "id": transaction.id,
                "amount": transaction.amount,
                "description": transaction.description,
                "transaction_type": transaction.transaction_type,
                "category": transaction.category,
                "date": transaction.date.isoformat() if transaction.date else None,
                "account_id": transaction.account_id
            })
        
        # Create export data
        export_data = {
            "export_info": {
                "exported_at": datetime.now().isoformat(),
                "version": "1.0.0",
                "total_accounts": len(accounts_data),
                "total_transactions": len(transactions_data)
            },
            "accounts": accounts_data,
            "transactions": transactions_data
        }
        
        return JSONResponse(
            content=export_data,
            headers={
                "Content-Disposition": f"attachment; filename=financial_dashboard_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            }
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Erro ao exportar dados: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 