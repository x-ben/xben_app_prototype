# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  avatar_id  :integer          indexed
#  name       :string(255)      not null
#  created_at :datetime
#  updated_at :datetime
#

class User < ActiveRecord::Base

  #  Associations
  #-----------------------------------------------
  belongs_to :avatar,
    class_name: 'Medium',
    dependent: :destroy
  has_many :foods, dependent: :destroy
  has_many :food_comments, dependent: :destroy
  has_many :lunch_boxes, dependent: :destroy


  #  Validations
  #-----------------------------------------------
  validates_associated :avatar
  validates :name,
    presence: true,
    length: { maximum: 150 }

end
