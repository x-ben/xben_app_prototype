# == Schema Information
#
# Table name: deals
#
#  id         :integer          not null, primary key
#  user_1_id  :integer          not null, indexed
#  user_2_id  :integer          not null, indexed
#  food_1_id  :integer          not null, indexed
#  food_2_id  :integer          not null, indexed
#  status     :integer          default(0), not null
#  created_at :datetime
#  updated_at :datetime
#

class Deal < ActiveRecord::Base

  extend Enumerize
  # include Concerns::EnumerizeExtension


  #  Associations
  #-----------------------------------------------
  belongs_to :user_1, class_name: 'User'
  belongs_to :user_2, class_name: 'User'
  belongs_to :food_1, class_name: 'Food'
  belongs_to :food_2, class_name: 'Food'


  #  Validations
  #-----------------------------------------------
  validates_associated :user_1, presence: true
  validates_associated :user_2, presence: true
  validates_associated :food_1, presence: true
  validates_associated :food_2, presence: true
  validates :status,
    presence: true,
    inclusion: { in: %w[pending waiting done] }


  #  Accessors
  #-----------------------------------------------
  enumerize :status,
     in: {
       pending: 0,
       waiting: 1,
       done:    2,
     },
     default: :pending,
     scope: true

  def me=(me)
    @me = me
  end

  def me
    @me
  end

  def other
    @me == self.user_1 ? self.user_2 : self.user_1
  end

  def other=(other)
    if self.user_1 == other
      @me = self.user_2
    else
      @me = self.user_1
    end
  end

end
