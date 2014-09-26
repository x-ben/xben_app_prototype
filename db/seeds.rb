IMAGES_PATH = Rails.root.join('spec', 'supports', 'images')


#  User
#-----------------------------------------------
puts '==> Creating users'

ActiveRecord::Base.transaction do
  def create_user(name, id)
    user = User.new(
      name:       name,
      konashi_id: 'konashi#4-1591',  # FIXME
      color:      0xff,
    )

    avatar_image = File.open(IMAGES_PATH.join('avatar', '%d.jpg' % id), 'rb')

    user.build_avatar asset: avatar_image

    user.save!
    print '#'

    user
  end

  $user_hamatani = create_user '浜谷光吉', 1
  $user_nagano = create_user 'Nagano Hikaru', 2

  puts
end


#  Food
#-----------------------------------------------
puts '==> Creating foods'

ActiveRecord::Base.transaction do
  $foods = []

  (1..3).each do |i|
    food = Food.new(
      user_id:     $user_hamatani.id,
      name:        '肉じゃが %d' % i,
      description: '自慢の肉じゃがです',
    )

    thumbnail_image = File.open(IMAGES_PATH.join('food', 'nikujaga.jpg'), 'rb')
    food.build_thumbnail asset: thumbnail_image

    food.save!
    $foods << food

    print '#'
  end

  (1..3).each do |i|
    food = Food.new(
      user_id:     $user_nagano.id,
      name:        'チャーシュー %d' % i,
      description: '伝説のチャーシューです',
    )

    thumbnail_image = File.open(IMAGES_PATH.join('food', 'tyahsyu.jpg'), 'rb')
    food.build_thumbnail asset: thumbnail_image

    food.save!
    $foods << food

    print '#'
  end

  puts
end
