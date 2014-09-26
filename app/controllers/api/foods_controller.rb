class Api::FoodsController < Api::ApplicationController

  def index
    @foods = Food
      .where(Food.arel_table[:user_id].not_eq(current_user.id))
      .order(created_at: :desc)

    render_json { |t|
      t[].foods!(@foods) { |food|
        food.thumbnail?
      }
    }
  end

  def like
    @food = Food.find params[:id]
    @food.like

    render nothing: true
  end

end
