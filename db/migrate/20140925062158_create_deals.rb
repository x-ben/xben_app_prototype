class CreateDeals < ActiveRecord::Migration
  def change
    create_table :deals do |t|
      t.belongs_to :user_1, null: false, index: true
      t.belongs_to :user_2, null: false, index: true
      t.belongs_to :food_1, null: false, index: true
      t.belongs_to :food_2, null: false, index: true

      t.integer :status, limit: 1, null: false, default: 0

      t.timestamps
    end
  end
end
