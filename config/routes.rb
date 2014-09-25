Rails.application.routes.draw do

  root to: 'pages#index'
  get :aaa, to: 'pages#aaa'

end
