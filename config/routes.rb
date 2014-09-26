Rails.application.routes.draw do

  root to: 'pages#index'

  namespace :api do

    resource :user, only: :show

    resources :foods, only: :index do
      resources :food_comments, only: %w[index create]

      post :like, on: :member
    end

  end

end
