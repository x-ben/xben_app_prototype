IMAGES_PATH = Rails.root.join('spec', 'supports', 'images')

users_attributes = [
  {
    name:       '濱谷光吉',
    konashi_id: 'konashi#4-1591', # FIXME
    food:       '肉じゃが',
  },
  {
    name:       '長野光',
    konashi_id: 'konashi#4-1591', # FIXME
    food:       'チャーシュー',
  },
  {
    name:       '今西智',
    konashi_id: 'konashi#0-0000',
    food:       'おかずのり',
  },
  {
    name:       '中澤優子',
    konashi_id: 'konashi#0-0000',
    food:       'パンケーキ',
  },
  {
    name:       '野木将兵',
    konashi_id: 'konashi#0-0000',
    food:       '梅紫蘇ロールとんかつ',
  },
  {
    name:       '岩永勇輝',
    konashi_id: 'konashi#0-0000',
    food:       '磯辺揚げ',
  },
]


#  User
#-----------------------------------------------
puts '==> Creating users'

ActiveRecord::Base.transaction do
  $users = []

  users_attributes.each.with_index(1) do |attr, i|
    user = User.new(
      name:       attr[:name],
      konashi_id: attr[:konashi_id],
    )

    avatar_image = File.open(IMAGES_PATH.join('avatar', '%d.jpg' % i), 'rb')

    user.build_avatar asset: avatar_image

    user.save!
    $users << user

    print '#'
  end

  puts
end


#  Food
#-----------------------------------------------
puts '==> Creating foods'

ActiveRecord::Base.transaction do
  $foods = []

  $users.each do |user|
    food_name = users_attributes[user.id - 1][:food]

    food = Food.new(
      user_id:     user.id,
      name:        food_name,
      description: "自慢の#{food_name}です",
    )

    thumbnail_image = File.open(IMAGES_PATH.join('food', '%d.jpg' % user.id), 'rb')
    food.build_thumbnail asset: thumbnail_image

    food.save!
    $foods << food

    print '#'
  end

  puts
end
