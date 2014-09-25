class CreateLunchBoxes < ActiveRecord::Migration
  def change
    create_table :lunch_boxes do |t|
      t.belongs_to :user, null: false, index: true

      t.string :konashi_id, null: false
      t.integer :color, limit: 1, null: false

      t.timestamps
    end

    add_index :lunch_boxes, :konashi_id
  end
end
