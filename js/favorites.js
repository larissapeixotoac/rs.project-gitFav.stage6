import { GithubUser } from "./githubUser.js"

class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem(`@github-favorites:`)) || []
    }

    save() {
        localStorage.setItem(`@github-favorites:`, JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)

            if(userExists) {
                throw new Error('Usuário já cadastrado.')
            }

            const user = await GithubUser.search(username)

            if(user.login === undefined) {
                throw new Error('Usuário não encontrado.')
            }
            // this.removeAllTr()
            this.entries = [user, ...this.entries]
            this.update()
            this.save()
        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }

}

class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        this.tbody = this.root.querySelector('table tbody')
        this.input = this.root.querySelector('.search input')

        this.update()
        this.onAdd()
        this.sortEntries()
    }

    onAdd() {
        const addButton = this.root.querySelector('.search button')
        
        window.document.onkeyup = event => {
            if(event.key === "Enter") {
                const { value } = this.root.querySelector('.search input')
                this.add(value)

                this.root.querySelector('.search input').value = ""            
            }
        }
        
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value) //value = username

            this.root.querySelector('.search input').value = ""            
        }      

    }

    sortEntries() {
        const sortButton = this.root.querySelector('button.sort-button')

        sortButton.onclick = () => {
            this.entries.sort((a, b) => {
                let nameA = ''
                let nameB = ''

                if(a.name !== null) {
                    nameA = a.name.toUpperCase()
                } else {
                    nameA = a.login
                } if(b.name !== null) {
                    nameB = b.name.toUpperCase()
                } else {
                    nameB = b.login
                }
    
                if(nameA < nameB) {
                    return -1
                } if(nameA > nameB) {
                    return 1
                }
    
                return 0
            })
    
            this.update()
            this.save()
        }
    }


    update() {
        //create condition to not remove when arent favorites!!!!!!!!!!!!!!!!!!!!!!!!!
        if(this.entries.find(entry => entry.login) ) {            
            this.removeAllTr()             
        }

        this.creatRow()

        this.entries.forEach( user => {
            const row = this.creatRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = `/${user.login}`
            row.querySelector('.repositories').innerHTML = user.public_repos
            row.querySelector('.followers').innerHTML = user.followers
            
            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?')
                if(isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })

    }

    creatRow() {
        const tr = document.createElement('tr')
        tr.classList.add('fav')

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/maykbrito.png" alt="Imagem de maykbrito">
                <a href="https://github.com/maykbrito" target="_blank">
                    <p>Mayk Brito</p>
                    <span>/maykbrito</span>
                </a>

                </td>

                <td class="repositories">
                    76
                </td>

                <td class="followers">
                    9589
                </td>
                <td>
                    <button class="remove">Remover</button>
            </td>                
        `

        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
            .forEach(tr => tr.remove())
    }
}

export { Favorites, FavoritesView }
