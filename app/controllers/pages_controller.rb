class PagesController < ApplicationController

  def index; end

  def aaa
    WebsocketRails[:cb].trigger 'ks.test', { a: 1324 }
  end

end
