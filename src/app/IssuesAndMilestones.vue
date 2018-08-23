<template>
<v-app id="app" toolbar footer>
	<v-container fluid>
		<v-layout align-center/>
			<v-flex xs12 text-xs-center>
				<h1>Vue/GitHub</h1>
			</v-flex>
			<v-flex xs4 offset-xs4 text-xs-center>
			<div id="divLogin"> <!--Div for the starter, login screen -->
			  <v-flex xs4 offset-xs4 text-xs-center>
				 			 <input
				 			ref="usernameTextBox" 
							v-model="username" 
							type="text" 
							class="form-control"
							placeholder="Usuário"
							v-on:keyup.enter="nextField"
							>
				</v-flex>
				<v-flex xs4 offset-xs4>			
							<input
							ref="repositoryTextBox" 
							v-model="password" 
							type="password" 
							class="form-control"
							placeholder="Senha"
							v-on:keyup.enter="login"
							>						
				</v-flex>
			  <v-btn @click.prevent.stop="login()">Login</v-btn>
			</div>
			</v-flex>

			<v-flex  align-content-center>	
				<div id="divRepositoryList" class="text-xs-center" hidden><!--Div that shows the repository list-->
					<v-flex xs12><!--Here's the avatar. Just to add some visual flair.-->
					  <v-avatar  size="64">  
				  		<img :src="avatarUrl" @error="imageLoadError" />
				    </v-avatar>

				     <!--Table with the repository list and a button for showing details.-->
					     <v-flex xs4 offset-xs4>
						     <h3>Qual repositório você deseja ver?</h3>
							    <table style="text-align: center" id="tableForRepositories">
									<tr v-for="repository in foundRepos":key="repository.number" >
										<td><v-btn class="button" @click.prevent.stop="chooseRepoFromList(repository.id,repository.name,repository.description)" block color="grey lighten-3" large>{{ repository.name }}</v-btn></td>
									</tr>
								</table>
						</v-flex>
				    </v-flex>

				    <v-flex  align-content-center><!--Div that shows details from selected repository-->
						<div id="divSpecificRepository" class="text-xs-center" hidden="true">
							<v-card>
							<h1>{{ repoDetails[1] }}</h1>
								<v-card>
								  {{ repoDetails[2] }}
								</v-card>
								<div id="divIssues" class="text-xs-center" hidden="true"> <!--Div that becomes visible to list issues-->
									<v-flex>
								        <table id="issueTable" width=100% class="tableGrayDetail">
								        	<tr v-if="areThereIssues" ><td>Titulo</td><td>Estado</td></tr>
								         	<tr v-for="issue in foundIssues":key="issue.number">
								       			<td>{{issue.title}}</td><td v-if="issue.state == 'open'">
								       				<v-btn @click="toggleIssue(issue.number, issue.state)" color="green lighten-2">Aberta</v-btn>
								       			</td>
								       			<td v-if="issue.state == 'closed'">
								       				<v-btn @click="toggleIssue(issue.number, issue.state)" color="red lighten-2">Fechada</v-btn>
								       			</td>
								       		</tr>
								       	</table>
									</v-flex> 
								</div>

								<div id="divMstones" class="text-xs-center" hidden="true"><!--Same as divv above, but for milestones -->
									<v-flex>
								        <table width=100% class="tableGrayDetail">
								        	<tr v-if="areThereMStones"><td>Titulo</td><td>Data de Entrega</td><td>Estado</td></tr>
								         	<tr v-for="milestone in foundMStones":key="milestone.number" v-bind:id="milestone.number">
								       			<td>{{ milestone.title }}</td>
								       			<td>{{ milestone.due_on }}</td>
								       			<td v-if="milestone.state == 'open'">
								       				<v-btn @click="toggleMiles(milestone.number, milestone.state)" color="green lighten-2">Aberta</v-btn>
								       			</td>
								       			<td v-if="milestone.state == 'closed'">
								       				<v-btn @click="toggleMiles(milestone.number, milestone.state)" color="red lighten-2">Fechada</v-btn>
								       			</td>
								       		</tr>
								       	</table>
									</v-flex> 
								</div>

								<v-btn @click.prevent.stop="listIssues(repoDetails[1])" >Issues</v-btn><!-- Buttons to choose between displaying issues or milestones -->
								<v-btn @click.prevent.stop="listMilestones(repoDetails[1])">Milestones</v-btn>									
							</v-card>
						</div>		  
					</v-flex>
		    	</div>
		    </v-flex>     	      	
		</v-layout>
	</v-container>

	<v-footer app id="footer" hidden="true">
		<v-btn@click.prevent.stop="logOff()" small outline color="red">Log Out</v-btn>
	</v-footer>
</v-app>
</template>

<script>
	import axios from "axios";//< Axios is what's bringing github to this here code. Very important. Very nice.

	export default{
		data(){
			return{
		 		username: '', 
				password:'',
				dialog:false,
				hardCodeIssueNum:0,
				areThereIssues:false,
				areThereMStones:false,
				newState:'',
				foundRepos: [],
				repoDetails: [],
				foundIssues: [],
				foundMStones: [],
				avatarUrl:'https://shiftcode.com.br/assets/images/shift-cover.png',		
				//^I learned the hard way that Vue absolutely loathes it if you start variable names with an '_'. Such as '_usernameVMod'. Which is bad because my js teacher had the habit of naming all his variables with _ and I got it from him. This commentary is just here in case someone wants to rename the variables and it suddenly stops working, that's why.
			};
		},
		methods:{
			login(){//This function throws the username and password at github, and waits for it to wave back that they match. If they don't, then it throws an error and does nothing
				axios({
					method:'get',
					url:'/user',
					baseURL:'https://api.github.com',
					auth:{
						username:this.username,
	 				 	password:this.password
					}
				}).then((response)=>{
					this.loginSuccessful(response);
				}).catch(function(error){
					console.log(error);
					alert('Erro de autenticação, verifique a senha e o nome de usuário.');
				})
			},
			loginSuccessful(userData){//If the information above matches, this function hides the login div and shows the other div, such as the footer with the logoff button.
				document.getElementById('divLogin').hidden=true;
				document.getElementById('divRepositoryList').hidden=false;
				document.getElementById('footer').hidden=false;
	            this.avatarUrl=userData.data.avatar_url;
	            this.getRepositoryList(userData);
			},
			getRepositoryList(userData){//This function gets repository data using Axios, and lists their names as buttons
				axios({
					method:'get',
					url:'/users/'+this.username+'/repos',
					baseURL:'https://api.github.com',
					auth:{
						username:this.username,
	 				 	password:this.password
					}
				}).then((response=>{
					this.foundRepos=response.data;
				}))
			},
			chooseRepoFromList(repoId,repoName,repoDescription){//This organizes the relevant data from the repository for display
				document.getElementById('divMstones').hidden = true;
				document.getElementById('divIssues').hidden = true;
				if (!repoDescription){
					repoDescription='(Sem descrição)'
				}
				this.repoDetails=[repoId,repoName,repoDescription];
				document.getElementById('divIssues').hidden=true;
				document.getElementById('divSpecificRepository').hidden=false;
			},
			listIssues(repoName){//This function gets issue data from the repository selected, using Axios
				axios({
					method:'get',
					url:'/repos/'+this.username+'/'+repoName+'/issues?state=all',
					baseURL:'https://api.github.com',
					timeout:1000,
					auth:{
						username:this.username,
	 				 	password:this.password
					}
				}).then((response)=>{
					if (response.data.length == 0){
						this.areThereIssues=false;
						this.foundIssues = [{title:'Não há issues nesse repositório'}]
					} else {
						this.areThereIssues = true;
						this.foundIssues=response.data;		
					}						
				})
				document.getElementById('divMstones').hidden = true;
				document.getElementById('divIssues').hidden = false;
			},
			toggleIssue(issueNumber, state){//This function toggles issues as open or closed
				if (state == "open"){
					this.newState = "closed";
				} else if (state == "closed"){
					this.newState = "open";
				}
				axios({
					method:'patch',
					url: "/repos/"+this.username+"/"+this.repoDetails[1]+"/issues/"+issueNumber,
					baseURL:'https://api.github.com',
					timeout:1000,
					auth:{
						username:this.username,
	 				 	password:this.password
					},
					data:{
						state:this.newState
					}
				}).then((response)=>{
					this.listIssues(this.repoDetails[1]);
				}).catch((error)=>{
					console.log(error);
				})
			},
			listMilestones(repoName){//This function gets and lists milestones through Axios
				this.foundMStones=[];
				axios({
					method:'get',
					url:'/repos/'+this.username+'/'+repoName+'/milestones?state=all',
					baseURL:'https://api.github.com',
					timeout:1000,
					auth:{
						username:this.username,
	 				 	password:this.password
					}
				}).then((response)=>{
					if (response.data.length == 0){
						this.areThereMStones = false;
						this.foundMStones = [{title:'Não há milestones nesse repositório'}]
					} else {
						this.areThereMStones = true;
						this.foundMStones=response.data;
					}												
				})
				document.getElementById('divIssues').hidden = true;
				document.getElementById('divMstones').hidden = false;
			},
			toggleMiles(mstNumber, state){//This function toggles milestones as open or closed at the request of a button.
				this.foundMStones = [];
				if (state == "open"){
					this.newState = "closed";
				} else if (state == "closed"){
					this.newState = "open";
				}
				axios({
					method:'patch',
					url: "/repos/"+this.username+"/"+this.repoDetails[1]+"/milestones/"+mstNumber,
					baseURL:'https://api.github.com',
					timeout:1000,
					auth:{
						username:this.username,
	 				 	password:this.password
					},
					data:{
						state:this.newState
					}
				}).then((response)=>{
					this.listMilestones(this.repoDetails[1]);
				}).catch((error)=>{
					console.log(error);
				})
			},
			nextField(){//This function is only for checking if the user pressed 'enter' after typing the username, so the focuse automatically goes to the next field. Entirely cosmetic, but expected.
					this.$refs.repositoryTextBox.value='';
					this.$refs.repositoryTextBox.focus();
			},
			imageLoadError(){
				this.avatarUrl='https://shiftcode.com.br/assets/images/shift-cover.png';
			},
			logOff(){//This function should just clear essetial variables and then hide all divs but the login one. 
				this.username='';
				this.password='';
				this.foundIssues=[];
				document.getElementById('footer').hidden = true;
				document.getElementById('divMstones').hidden = true;
				document.getElementById('divIssues').hidden = true;
				document.getElementById('divLogin').hidden = false;
				document.getElementById('divRepositoryList').hidden = true;
			}
		},
	};
</script>