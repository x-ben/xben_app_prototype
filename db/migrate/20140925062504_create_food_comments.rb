class CreateFoodComments < ActiveRecord::Migration
  def change
    create_table :food_comments do |t|
      t.belongs_to :food, null: false, index: true
      t.belongs_to :user, null: false, index: true

      t.text :body

      t.timestamps
    end
  end
end
