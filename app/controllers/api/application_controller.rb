module Api
  class ApplicationController < ActionController::Base

    # protect_from_forgery with: :exception

    protected def current_user
      User.find session[:user_id]
    end

  end
end
