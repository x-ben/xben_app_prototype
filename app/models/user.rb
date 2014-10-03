# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  avatar_id  :integer          indexed
#  name       :string(255)      not null
#  konashi_id :string(255)      not null, indexed
#  color      :integer          not null
#  created_at :datetime
#  updated_at :datetime
#

class User < ActiveRecord::Base

  attr_json :id, :avatar_id
  attr_json :name, :konashi_id, :color
  attr_json :errors


  #  Associations
  #-----------------------------------------------
  belongs_to :avatar,
    class_name: 'Medium',
    dependent: :destroy
  has_many :foods, dependent: :destroy
  has_many :food_comments, dependent: :destroy


  #  Nested attributes
  #-----------------------------------------------
  accepts_nested_attributes_for :avatar


  #  Validations
  #-----------------------------------------------
  validates_associated :avatar
  validates :name,
    presence: true,
    length: { maximum: 150 }
  validates :konashi_id,
    presence: true,
    format: { with: /\Akonashi#\d-\d{4}\z/ }
  validates :color,
    presence: true,
    numericality: {
      only_integer:             true,
      greater_than_or_equal_to: 0x00,
      less_than_or_equal_to:    0xff,
    }

end
