class PagesController < ApplicationController

  def index
    session[:user_id] = params[:user_id]
  end

end
