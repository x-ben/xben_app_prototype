class AddForeignKeys < ActiveRecord::Migration
  def change
    add_foreign_key :foods, :users, column: :user_id, dependent: :delete
    add_foreign_key :foods, :media, column: :thumbnail_id, dependent: :nullify

    add_foreign_key :food_comments, :users, column: :user_id, dependent: :delete
    add_foreign_key :food_comments, :foods, column: :food_id, dependent: :delete

    add_foreign_key :users, :media, column: :avatar_id, dependent: :nullify
  end
end
