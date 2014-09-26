class Api::FoodsController < Api::ApplicationController

  def index
    @foods = Food
      .includes(
        :thumbnail,
        { user: [:avatar] },
      )
      .where(Food.arel_table[:user_id].not_eq(current_user.id))
      .order(created_at: :desc)

    render_json { |t|
      t[].foods!(@foods) { |food|
        food.thumbnail?
        food.user! { |user|
          user.avatar?
        }
      }
    }
  end

  def like
    @food = Food.find params[:id]
    @food.like

    render nothing: true
  end

end
