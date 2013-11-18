require 'rubygems'
require 'sinatra'
require 'sinatra/sequel'
require 'json'
require 'haml'

enable :sessions
set :database, 'postgres://localhost/tasks'
set :root, File.dirname(__FILE__)
set :views, Proc.new { File.join(root, "views") } 

migration "create tasks table" do

	database.create_table :tasks do
		primary_key :id
		text        :name
		date        :due
		integer     :priority
		text        :assignee
		boolean     :completed
		timestamp   :created
	end
end

migration "add description to tasks" do
	database.alter_table :tasks do
		add_column :description, :text
	end
end

class Task < Sequel::Model
end

helpers do
	def logged_in?
		session[:user].eql? "root"
	end
end

get '/' do
	if logged_in?
		ds1 = Task.where(:completed => false)
		@pool = ds1.where(:assignee => "pool")
		@assigned = ds1.where(:assignee => session[:user])
		haml :index
	else
		haml :login
	end
end

post '/login' do
	if (params[:username] == "root" && params[:password] == "root")
		session[:user] = "root"
	end
	redirect '/'
end

get '/logout' do
	session[:user] = nil
	redirect '/'
end

get '/tasks' do
	task = Task[1]

	task.name
end

post '/createtask' do
	task = Task.create(:name => params[:name], :due => params[:due], :priority => params[:priority], :assignee => params[:assignee], :description => params[:description], :completed => 0, :created => Time.now)

	content_type :json
	{ :id => task.id }.to_json
end

post '/completetask' do
	task = Task[params[:taskId]]
	task[:completed] = true
	task.save

	content_type :json
	{ :success => "yes" }.to_json
end

post '/assigntask' do
	task = Task[params[:taskId]]
	task[:assignee] = session[:user]
	task.save

	content_type :json
	{ :id => task.id, :user => task.assignee }.to_json
end

post '/releasetask' do
	task = Task[params[:taskId]]
	task[:assignee] = "pool"
	task.save

	content_type :json
	{ :id => task.id }.to_json
end
