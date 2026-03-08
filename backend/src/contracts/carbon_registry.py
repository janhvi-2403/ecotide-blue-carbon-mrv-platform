from pyteal import *

"""
EcoTide Carbon Registry Smart Contract
- Manages Admin authorization
- Stores hashes of verified MRV reports
- Mints Carbon Credit ASAs upon verification
"""

# State Keys
ADMIN_KEY = Bytes("admin")
CREDITS_ISSUED_KEY = Bytes("total_credits")

def contract_approval():
    # 1. Initialization (OnCreate)
    # Sets the creator as the initial admin
    handle_creation = Seq(
        App.globalPut(ADMIN_KEY, Txn.sender()),
        App.globalPut(CREDITS_ISSUED_KEY, Int(0)),
        Approve()
    )

    # 2. Update/Delete (Admin only)
    handle_update = Seq(
        Assert(Txn.sender() == App.globalGet(ADMIN_KEY)),
        Approve()
    )
    
    handle_delete = Seq(
        Assert(Txn.sender() == App.globalGet(ADMIN_KEY)),
        Approve()
    )

    # 3. Actions (NoOp)
    # Action: Verify Report & Mint Credits
    # Arguments: ["verify", report_hash, amount_to_mint]
    report_hash = Txn.application_args[1]
    mint_amount = Btoi(Txn.application_args[2])

    verify_and_mint = Seq(
        # Authorization check
        Assert(Txn.sender() == App.globalGet(ADMIN_KEY)),
        # Logic: Store hash in local state or global log
        # For simplicity, we log it and update global stats
        App.globalPut(CREDITS_ISSUED_KEY, App.globalGet(CREDITS_ISSUED_KEY) + mint_amount),
        Log(Concat(Bytes("VERIFIED:"), report_hash)),
        
        # Real-world: This would trigger an Inner Transaction to mint an ASA
        # InnerTxnBuilder.Begin(),
        # InnerTxnBuilder.SetFields({
        #     TxnField.type_enum: TxnType.AssetConfig,
        #     TxnField.config_asset_total: mint_amount,
        #     TxnField.config_asset_name: Bytes("EcoTide Carbon Credit"),
        #     ...
        # }),
        # InnerTxnBuilder.Submit(),
        
        Approve()
    )

    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_update],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_delete],
        [Txn.on_completion() == OnComplete.NoOp, 
            Cond(
                [Txn.application_args[0] == Bytes("verify"), verify_and_mint]
            )
        ]
    )

    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    with open("carbon_registry_approval.teal", "w") as f:
        compiled = compileTeal(contract_approval(), mode=Mode.Application, version=6)
        f.write(compiled)

    with open("carbon_registry_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled)
