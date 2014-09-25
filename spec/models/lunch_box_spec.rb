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

require 'rails_helper'

RSpec.describe LunchBox, :type => :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
