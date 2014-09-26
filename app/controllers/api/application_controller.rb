module Api
  class ApplicationController < ActionController::Base

    # protect_from_forgery with: :exception

    before_action :set_default_url_options_by_request!

    protected def set_default_url_options_by_request!
      protocol = request.protocol
      host = request.host_with_port

      # asset host
      ActionController::Base.asset_host = "#{protocol}#{host}"
    end

    protected def current_user
      User.find session[:user_id]
    end

  end
end
