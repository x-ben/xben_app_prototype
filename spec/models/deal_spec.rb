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

require 'rails_helper'

RSpec.describe Deal, :type => :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
