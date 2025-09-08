module web3face_nft::trustless_swap {
    use std::option;
    use std::string::String;
    use sui::object;
    use sui::object::{ID, UID};
    use sui::transfer;
    use sui::tx_context::{TxContext, sender};
    use sui::clock::Clock;
    use sui::event;

    // 错误码定义
    const EExpired: u64 = 0;           // 交换已过期
    const ENotExpired: u64 = 1;        // 交换未过期
    const ENotCounterparty: u64 = 2;   // 不是交易对手
    const ETypeMismatch: u64 = 3;      // 类型不匹配
    const ENotOwner: u64 = 4;          // 不是所有者

    // 创建新交换时发出的事件
    public struct SwapCreated has copy, drop {
        swap_id: ID,           
        owner: address,        
        counterparty: address, // 交易对手地址
        offered_type: String,  // 提供的资产类型
        asked_type: String,    // 请求的资产类型
        expire_timestamp: u64  
    }

    // 交换完成时发出的事件
    public struct SwapCompleted has copy, drop {
        swap_id: ID,           
        owner: address,        
        counterparty: address  // 交易对手地址
    }

    // 交换取消时发出的事件
    public struct SwapCancelled has copy, drop {
        swap_id: ID,           
        owner: address         
    }

    // 主要的交换对象，代表一个无需信任的交换提议
    public struct Swap<Offered: store, Asked: store> has key, store {
        id: UID,                // 对象唯一ID
        owner: address,         // 交换创建者地址
        counterparty: address,  // 交易对手地址
        offered: Offered,       // 提供的资产
        asked_type: String,     // 请求的资产类型名称
        expire_timestamp: u64,  
    }

    // ========== 公共API ==========

    // 创建新的无需信任交换
    public entry fun create_swap<Offered: store, Asked: store>(
        offered: Offered,           // 提供的资产
        asked_type: String,         // 请求的资产类型
        counterparty: address,      // 交易对手地址
        expire_timestamp: u64,      
        ctx: &mut TxContext         
    ) {
        let swap = Swap<Offered, Asked> {
            id: object::new(ctx),
            owner: tx_context::sender(ctx), // 发送者作为所有者
            counterparty,
            offered,
            asked_type: copy asked_type,
            expire_timestamp
        };

        // 发出创建事件
        event::emit(SwapCreated {
            swap_id: object::id(&swap),
            owner: swap.owner,
            counterparty: swap.counterparty,
            offered_type: type_name<Offered>(),
            asked_type: copy asked_type,
            expire_timestamp
        });

        // 将交换对象转移给创建者
        transfer::transfer(swap, tx_context::sender(ctx));
    }

    // 通过提供请求的资产来完成交换
    public entry fun complete_swap<Offered: key + store + copy, Asked: key + store>(
        swap: &mut Swap<Offered, Asked>, // 交换对象引用
        sent: Asked,                     // 发送的资产
        _clock: &Clock,                  // 时钟对象
        ctx: &mut TxContext              
    ) {
        // 验证发送者是交易对手
        assert!(tx_context::sender(ctx) == swap.counterparty, ENotCounterparty);

        // 验证发送类型与请求类型匹配
        let sent_type = type_name<Asked>();
        assert!(sent_type == swap.asked_type, ETypeMismatch);

        // 将提供的资产转移给交易对手
        let offered = swap.offered;
        transfer::public_transfer(offered, swap.counterparty);

        // 将发送的资产转移给所有者
        transfer::public_transfer(sent, swap.owner);

        let swap_id = object::id(swap);
        let owner = swap.owner;
        let counterparty = swap.counterparty;

        // 发出完成事件
        event::emit(SwapCompleted {
            swap_id,
            owner,
            counterparty
        });

        // 删除交换对象
    }

    // 取消已过期的交换
    public entry fun cancel_swap<Offered: key + store + copy, Asked: store>(
        swap: &mut Swap<Offered, Asked>, // 交换对象引用
        _clock: &Clock,                  // 时钟对象
        ctx: &mut TxContext              
    ) {
        
        // 验证发送者是所有者
        assert!(tx_context::sender(ctx) == swap.owner, ENotOwner);

        // 将提供的资产返还给所有者
        let offered = swap.offered;
        transfer::public_transfer(offered, swap.owner);

        let swap_id = object::id(swap);
        let owner = swap.owner;

        // 发出取消事件
        event::emit(SwapCancelled {
            swap_id,
            owner
        });

        // 删除交换对象
    }

   
    // ========== 工具函数 ==========

    // 获取类型名称作为字符串
    fun type_name<T>(): String {        
        let type_str = b"UnknownType";
        std::string::utf8(type_str)
    }

    // 查看函数，用于检查交换详情
    fun view_swap<Offered: store, Asked: store>(swap: &Swap<Offered, Asked>): (
        address,
        address,
        String,
        String,
        u64
    ) {
        (
            swap.owner,
            swap.counterparty,
            type_name<Offered>(),
            copy swap.asked_type,
            swap.expire_timestamp,
        )
    }
}
