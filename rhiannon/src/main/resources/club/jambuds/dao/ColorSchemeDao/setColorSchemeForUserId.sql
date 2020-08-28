INSERT INTO color_schemes
    (user_id, background_gradient_name, text_color)
VALUES
    (:userId, :backgroundGradientName, :textColor)
ON CONFLICT ("user_id") DO
    UPDATE SET
        background_gradient_name = :backgroundGradientName,
        text_color = :textColor