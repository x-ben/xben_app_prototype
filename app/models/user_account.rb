# == Schema Information
#
# Table name: user_accounts
#
#  id                     :integer          not null, primary key
#  user_id                :integer          not null, indexed
#  email                  :string(255)      default(""), not null, indexed
#  encrypted_password     :string(255)      default(""), not null
#  reset_password_token   :string(255)      indexed
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string(255)
#  last_sign_in_ip        :string(255)
#  created_at             :datetime
#  updated_at             :datetime
#

class UserAccount < ActiveRecord::Base

  #  Associations
  #-----------------------------------------------
  belongs_to :user, dependent: :destroy


  #  Nested attributes
  #-----------------------------------------------
  accepts_nested_attributes_for :user


  #  Validations
  #-----------------------------------------------
  validates_associated :user, presence: true
  validates :email, presence: true, email: true


  #  Devise
  #-----------------------------------------------
  devise :database_authenticatable,
    :registerable,
    :recoverable,
    :rememberable,
    :trackable,
    :validatable

end
