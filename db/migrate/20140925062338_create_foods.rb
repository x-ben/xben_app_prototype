class CreateFoods < ActiveRecord::Migration
  def change
    create_table :foods do |t|
      t.belongs_to :user, null: false, index: true
      t.belongs_to :thumbnail

      t.string :name, null: false
      t.text :description
      t.integer :likes_count, null: false, default: 0

      t.timestamps
    end
  end
end
