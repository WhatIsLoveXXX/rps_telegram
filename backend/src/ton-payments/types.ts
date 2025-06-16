export enum TransactionType {
    DEPOSIT = 0,
    WITHDRAW = 1,
}

export enum TransactionStatus {
    CREATED = 0,
    REJECTED = 1,
}

export type TonTransaction = {
    account: string;
    hash: string;
    lt: string;
    now: number;
    orig_status: 'uninit';
    end_status: 'uninit';
    total_fees: string;
    prev_trans_hash: string;
    prev_trans_lt: string;
    description: {
        type: 'ord';
        action: {
            valid: boolean;
            success: boolean;
            no_funds: boolean;
            result_code: number;
            tot_actions: number;
            msgs_created: number;
            spec_actions: number;
            tot_msg_size: {
                bits: string;
                cells: string;
            };
            status_change: 'unchanged';
            skipped_actions: number;
            action_list_hash: string;
        };
        aborted: boolean;
        credit_ph: {
            credit: string;
        };
        destroyed: boolean;
        compute_ph: {
            mode: number;
            type: 'vm';
            success: boolean;
            gas_fees: string;
            gas_used: string;
            vm_steps: number;
            exit_code: number;
            gas_limit: string;
            msg_state_used: boolean;
            account_activated: boolean;
            vm_init_state_hash: string;
            vm_final_state_hash: string;
        };
        storage_ph: {
            status_change: 'unchanged';
            storage_fees_collected: string;
        };
        credit_first: boolean;
    };
    block_ref: {
        workchain: number;
        shard: string;
        seqno: number;
    };
    in_msg: {
        hash: string;
        source: string;
        destination: string;
        value: string;
        fwd_fee: string;
        ihr_fee: string;
        created_lt: string;
        created_at: string;
        opcode: string;
        ihr_disabled: boolean;
        bounce: boolean;
        bounced: boolean;
        import_fee: string;
        message_content: {
            hash: string;
            body: string;
            decoded: {
                comment: string;
            };
        };
        init_state: {
            hash: string;
            body: string;
        };
    };
    out_msgs: Array<{
        hash: string;
        source: string;
        destination: string;
        value: string;
        fwd_fee: string;
        ihr_fee: string;
        created_lt: string;
        created_at: string;
        opcode: string;
        ihr_disabled: boolean;
        bounce: boolean;
        bounced: boolean;
        import_fee: string;
        message_content: {
            hash: string;
            body: string;
            decoded: {
                comment: string;
            };
        };
        init_state: {
            hash: string;
            body: string;
        };
    }>;
    account_state_before: {
        hash: string;
        balance: string;
        account_status: 'uninit';
        frozen_hash: string;
        code_hash: string;
        data_hash: string;
    };
    account_state_after: {
        hash: string;
        balance: string;
        account_status: 'uninit';
        frozen_hash: string;
        code_hash: string;
        data_hash: string;
    };
    mc_block_seqno: number;
};

type AddressBook = {
    [key: string]: {
        user_friendly: string;
    };
};

export type TonTransactionsResponse = {
    transactions: TonTransaction[];
    address_book: AddressBook;
};
