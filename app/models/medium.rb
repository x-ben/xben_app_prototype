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

class Medium < ActiveRecord::Base

  attr_json :id

  attr_json { |medium|
    medium.medium_url    { |m| m.url :medium }
    medium.thumbnail_url { |m| m.url :thumbnail }
    medium.small_url     { |m| m.url :small }
  }

  # include Concerns::PaperclipExtension


  #  Paperclip
  #-----------------------------------------------
  has_attached_file :asset,
    styles: {
      medium:    '640x640#',
      thumbnail: '240x170#',
      small:     '300>',
    },
    convert_options: {
      large: '-strip',
      small: '-quality 75 -strip',
    }

  # attr_file_renamer :asset


  #  Validations
  #-----------------------------------------------
  validates_attachment :asset,
    presence: true,
    content_type: {
      content_type: %w[image/jpeg image/jpg image/pjpeg image/png]
    },
    attachment_size: { less_than: 5.megabyte }


  #  Accessors
  #-----------------------------------------------
  def url(style_name = :thumbnail, options = {})
    asset.url style_name, options if asset.present?
  end

end
