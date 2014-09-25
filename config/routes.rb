Rails.application.routes.draw do

  devise_for :user_accounts
  root to: 'pages#index'
  get :aaa, to: 'pages#aaa'

end
