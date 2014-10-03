class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.belongs_to :avatar

      t.string :name, null: false
      t.string :konashi_id, null: false

      t.timestamps
    end

    add_index :users, :konashi_id
  end
end
