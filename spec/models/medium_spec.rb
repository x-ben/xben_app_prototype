# == Schema Information
#
# Table name: media
#
#  id                 :integer          not null, primary key
#  asset_file_name    :string(255)
#  asset_content_type :string(255)
#  asset_file_size    :integer
#  asset_updated_at   :datetime
#  created_at         :datetime
#  updated_at         :datetime
#

require 'rails_helper'

RSpec.describe Medium, :type => :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
