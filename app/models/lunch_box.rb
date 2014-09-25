# == Schema Information
#
# Table name: lunch_boxes
#
#  id         :integer          not null, primary key
#  user_id    :integer          not null, indexed
#  konashi_id :string(255)      not null, indexed
#  color      :integer          not null
#  created_at :datetime
#  updated_at :datetime
#

class LunchBox < ActiveRecord::Base

  #  Associations
  #-----------------------------------------------
  belongs_to :user


  #  Validations
  #-----------------------------------------------
  validates_associated :user, presence: true
  validates :colors,
    presence: true,
    numericality: {
      only_integer:             true,
      greater_than_or_equal_to: 0x00,
      less_than_or_equal_to:    0xff,
    }

end
