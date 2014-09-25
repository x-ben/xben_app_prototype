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

require 'rails_helper'

RSpec.describe FoodComment, :type => :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
