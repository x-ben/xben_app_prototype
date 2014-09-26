class Api::FoodCommentsController < Api::ApplicationController

  def index
    @comments = FoodComment
      .includes(
        { user: [:avatar] },
      )
      .where(food_id: params[:food_id])
      .order(created_at: :desc)

    render_json { |t|
      t[].food_comments!(@comments) { |comment|
        comment.user! { |user|
          user.avatar?
        }
      }
    }
  end

  def create
    @comment = FoodComment.new permit_params
    @comment.food_id = params[:food_id]
    @comment.user_id = current_user.id

    self.status = @comment.save ? :ok : :unprocessable_entity

    render_json { |t|
      t.food_comment!(@comment) { |comment|
        comment.user! { |user|
          user.avatar?
        }
      }
    }
  end

  def permit_params
    params
    .require(:food_comment)
    .permit(:body)
  end

end
