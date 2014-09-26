class Api::UsersController < Api::ApplicationController

  def show
    @the_other = User
      .where(User.arel_table[:id].not_eq(current_user.id))
      .first

    render_json { |t|
      t.user!(current_user) { |user|
        user.avatar?
      }

      t.the_other_user!(@the_other) { |user|
        user.avatar?
      }
    }
  end

end
