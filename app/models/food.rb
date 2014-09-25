# == Schema Information
#
# Table name: foods
#
#  id           :integer          not null, primary key
#  user_id      :integer          not null, indexed
#  thumbnail_id :integer          indexed
#  name         :string(255)      not null
#  description  :text
#  likes_count  :integer          default(0), not null
#  created_at   :datetime
#  updated_at   :datetime
#

class Food < ActiveRecord::Base

  #  Associations
  #-----------------------------------------------
  belongs_to :user
  belongs_to :thumbnail,
    class_name: 'Medium',
    dependent: :destroy
  has_many :deals, dependent: :destroy
  has_many :food_comments, dependent: :destroy


  #  Validations
  #-----------------------------------------------
  validates_associated :user, presence: true
  validates_associated :thumbnail
  validates :name,
    presence: true,
    length: { maximum: 150 }
  validates :description, length: { maximum: 1000 }

end
