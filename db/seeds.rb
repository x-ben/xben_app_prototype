#  User
#-----------------------------------------------
puts '==> Creating users'
=begin
ActiveRecord::Base.transaction do
  $user_accounts = []

  (1..5).each do |i|
    user_account = UserAccount.new(
      email:    'user+%d@example.com' % i,
      password: 'password'
    )

    user = user_account.build_user(
      avatar: File.open('', 'rb'),
      name:   Gimei.new.kanji,
    )

    user_basis.lunch_boxes.build(
      konashi_id: '#111',
      color:      0xff,
    )

    user_account.save!
    $user_accounts << user_account

    print '#'
  end

  puts

  $the_user_account = $user_accounts.first
end
=end
