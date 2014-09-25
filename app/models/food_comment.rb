# == Schema Information
#
# Table name: food_comments
#
#  id         :integer          not null, primary key
#  food_id    :integer          not null, indexed
#  user_id    :integer          not null, indexed
#  body       :text
#  created_at :datetime
#  updated_at :datetime
#

class FoodComment < ActiveRecord::Base

  #  Associations
  #-----------------------------------------------
  belongs_to :food
  belongs_to :user


  #  Validations
  #-----------------------------------------------
  validates_associated :food, presence: true
  validates_associated :user, presence: true
  validates :body,
    presence: true,
    length: { maximum: 1000 }

end
