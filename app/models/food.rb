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

  attr_json :id, :user_id, :thumbnail_id
  attr_json :name, :description, :likes_count
  attr_json :errors


  #  Associations
  #-----------------------------------------------
  belongs_to :user
  belongs_to :thumbnail,
    class_name: 'Medium',
    dependent: :destroy
  has_many :food_comments, dependent: :destroy


  #  Nested attributes
  #-----------------------------------------------
  accepts_nested_attributes_for :thumbnail


  #  Validations
  #-----------------------------------------------
  validates_associated :user, presence: true
  validates_associated :thumbnail
  validates :name,
    presence: true,
    length: { maximum: 150 }
  validates :description, length: { maximum: 1000 }


  #  Callbacks
  #-----------------------------------------------
  after_update do |food|
    if food.likes_count_changed?
      WebsocketRails[:main].trigger 'food.update_likes_count', {
        id:          food.id,
        likes_count: food.likes_count,
      }
    end
  end


  #  Actions
  #-----------------------------------------------
  def like
    self.increment! :likes_count
  end

end
