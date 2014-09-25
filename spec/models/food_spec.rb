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

require 'rails_helper'

RSpec.describe Food, :type => :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
