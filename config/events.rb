WebsocketRails::EventMap.describe do

  namespace :comments do
    subscribe :create,
      to: CommentsController,
      with_method: :create
  end

end
