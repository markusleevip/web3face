module web3face_nft::marketplace {
    use sui::tx_context::{sender};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::table::{Self, Table};
    use sui::dynamic_field;
    use std::string::{String, utf8};
    use web3face_nft::web3face_nft::MyNFT;

    // 寄卖列表，存储所有正在寄卖的NFT
    public struct Marketplace has key {
        id: UID,
        // 使用Table存储所有寄卖信息，便于查询
        listings: Table<address, Listing>,
    }

    // 寄卖条目，存储单个NFT的寄卖信息
    public struct Listing has store, copy, drop {
        nft_id: address,
        seller: address,
        price: u64,
        // 添加更多可查询的字段
        nft_name: String,
        image_url: String,
    }

    // 错误代码
    const E_NOT_ENOUGH_PAYMENT: u64 = 0;
    const E_NOT_SELLER: u64 = 1;
    const E_LISTING_NOT_FOUND: u64 = 2;

    /// 初始化市场
    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            listings: table::new(ctx)
        };
        transfer::share_object(marketplace);
    }

    /// 用户上架NFT寄卖
    public entry fun list_nft(
        marketplace: &mut Marketplace,
        nft: MyNFT,
        price: u64,
        ctx: &mut TxContext
    ) {
        let nft_id = object::id_to_address(&object::id(&nft));
        let seller = sender(ctx);
        
        // 创建寄卖信息（暂时不存储NFT名称和图片URL，因为字段访问受限）
        let listing = Listing {
            nft_id,
            seller,
            price,
            nft_name: utf8(b"Unknown"), // 使用默认值
            image_url: utf8(b""),       // 使用空字符串
        };
        
        // 将寄卖信息添加到Table中
        table::add(&mut marketplace.listings, nft_id, listing);
        
        // 使用动态字段存储NFT对象本身
        dynamic_field::add(&mut marketplace.id, nft_id, nft);
    }

    /// 用户购买寄卖的NFT
    public entry fun buy_nft(
        marketplace: &mut Marketplace,
        payment: Coin<SUI>,
        nft_id: address,
        ctx: &mut TxContext
    ) {
        // 获取寄卖信息
        let listing: Listing = table::remove(&mut marketplace.listings, nft_id);
        
        // 验证支付金额是否足够
        assert!(coin::value(&payment) >= listing.price, E_NOT_ENOUGH_PAYMENT);
        
        // 获取NFT对象
        let nft: MyNFT = dynamic_field::remove(&mut marketplace.id, nft_id);
        
        // 将支付金额转移给卖家
        transfer::public_transfer(payment, listing.seller);
        
        // 将NFT转移给买家
        transfer::public_transfer(nft, sender(ctx));
    }

    /// 用户取消寄卖
    public entry fun cancel_listing(
        marketplace: &mut Marketplace,
        nft_id: address,
        ctx: &mut TxContext
    ) {
        // 获取寄卖信息
        let listing: Listing = table::remove(&mut marketplace.listings, nft_id);
        
        // 验证调用者是卖家
        assert!(listing.seller == sender(ctx), E_NOT_SELLER);
        
        // 获取NFT对象
        let nft: MyNFT = dynamic_field::remove(&mut marketplace.id, nft_id);
        
        // 将NFT返回给卖家
        transfer::public_transfer(nft, sender(ctx));
    }

    /// 获取寄卖信息（只读函数）- 便于RPC查询
    public fun get_listing(marketplace: &Marketplace, nft_id: address): &Listing {
        table::borrow(&marketplace.listings, nft_id)
    }

    /// 检查NFT是否正在寄卖
    public fun is_listed(marketplace: &Marketplace, nft_id: address): bool {
        table::contains(&marketplace.listings, nft_id)
    }

    /// 获取所有寄卖NFT的数量
    public fun listing_count(marketplace: &Marketplace): u64 {
        table::length(&marketplace.listings)
    }
}
