module web3face_nft::web3face_nft {
    use sui::tx_context::{sender};
    use std::string::{utf8, String};
    use sui::package;
    use sui::display;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI; 



    const FEE_RECIPIENT: address = @0xb2cd0ac7b0f69b4b91515ea7ea8381918ec4fbf63b17b6645d4bc2b129025218;
     // 设置费用为 0.2 SUI
    const INIT_FEE_AMOUNT: u64 = 200_000_000;

    
    // AdminCap 结构体：表示管理员权限
    public struct AdminCap has key, store {
        id: UID,
    }

    // FeeConfig 结构体：存储可变的手续费金额
    public struct FeeConfig has key, store {
        id: UID,
        fee_amount: u64,
    }

    public struct MyNFT has key, store {
        id: UID,
        name: String,
        image_url: String,
    }

    public struct WEB3FACE_NFT has drop {}


    fun init(otw: WEB3FACE_NFT, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"link"),
            utf8(b"image_url"),
            utf8(b"creator"),
        ];

        let values = vector[
            utf8(b"{name}"),
            utf8(b"https://web3face.xyz/"),
            utf8(b"{image_url}"),
            utf8(b"Web3face")
        ];

        let publisher = package::claim(otw, ctx);

        let mut display = display::new_with_fields<MyNFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut display);

                // 创建 AdminCap 和 FeeConfig 对象
        let admin_cap = AdminCap { id: object::new(ctx) };
        // 初始手续费
        let fee_config = FeeConfig { id: object::new(ctx), fee_amount: INIT_FEE_AMOUNT };

        transfer::public_transfer(publisher, sender(ctx));
        transfer::public_transfer(display, sender(ctx));
        // 将 AdminCap 转移给 FEE_RECIPIENT（将成为管理员）
        transfer::public_transfer(admin_cap, FEE_RECIPIENT);
        // 将 FeeConfig 对象设置为共享，以便任何人都可以读取其值
        transfer::share_object(fee_config);
    }

    public entry fun mint(payment_coin: Coin<SUI>, name: String, image_url: String, fee_config: &FeeConfig, ctx: &mut TxContext) {
        // 从 FeeConfig 中读取当前的手续费金额
        let fee_amount = fee_config.fee_amount;
        // Verify payment amount is sufficient
        assert!(coin::value(&payment_coin) >= fee_amount, 0);
        
        // Transfer the fee to the designated recipient address.
        transfer::public_transfer(payment_coin, FEE_RECIPIENT);

        // Create a new unique ID for the NFT.
        let id = object::new(ctx);
        // Construct the MyNFT object with the provided name and image_url.
        let nft = MyNFT { id, name, image_url };

        transfer::public_transfer(nft, sender(ctx));
    }

    /// 管理员入口函数：修改手续费金额。
    /// 只有 AdminCap 的持有者才能调用此函数。
    /// 需要传入 AdminCap 的共享引用和 FeeConfig 的可变引用。
    public entry fun update_fee(
        _admin_cap: &AdminCap, // 验证调用者是否持有 AdminCap
        fee_config: &mut FeeConfig, // FeeConfig 必须是可变引用才能修改
        new_fee_amount: u64,
        _ctx: &mut TxContext // TxContext 在这里未使用，但通常保留
    ) {
        // 更新 FeeConfig 中存储的手续费金额
        fee_config.fee_amount = new_fee_amount;
    }

}
