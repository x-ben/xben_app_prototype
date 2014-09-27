Rails.application.routes.draw do

  root to: 'pages#index'

  namespace :api do

    resource :user, only: :show

    resources :foods, only: :index do
      post :like, on: :member
    end

  end

end
