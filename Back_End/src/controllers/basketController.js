const updateBasket = async (req, res) => {
  try {
    const { userId, productId, quantity, stock } = req.body;

    // Kiểm tra số lượng tồn kho
    if (quantity > stock) {
      return res.status(400).json({
        success: false,
        message: `Số lượng đặt hàng đã đạt giới hạn tồn kho (${stock} sản phẩm)`
      });
    }

    // Cập nhật giỏ hàng
    const basket = await Basket.findOneAndUpdate(
      { userId, "items.productId": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    if (!basket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng"
      });
    }

    res.json({
      success: true,
      data: basket
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};