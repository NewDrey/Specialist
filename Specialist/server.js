import { sqlConnect, registerUser, loginUser, registerWorker, deleteWorker, deleteUser,
    getServicesList, loginWorker, createNewOrder, findOrderByUser, findServicesByWorker,
    findServiceDetails, changeServiceWorker, addServiceWorker, findAvailableOrders, orderDiscription,
    createNewChat, findChat, newMessage, findAllMessages, findAllChats, findUser, changeUser,
    changeWorker, findWorker, changeOrder, findAllOrdersByUser, changeOrderStatus, findWorkersActiveChats,
    getServiceName
} from './specialist/scripts/sqlScripts.js';
import express from 'express';
/*var escapeHtml = require('escape-html')*/
const app = express();
import session from 'express-session';
import path from 'path'; 
import bodyParser from 'body-parser';
const port = 1337;
var jsonParser = bodyParser.urlencoded();
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from "http";
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename)

const io = new Server(createServer(app).listen(port), () => {
    console.log(`Server is running on port ${port}`);
})

app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false
    }));

const isAuthenticatedWorker = (req, res) => {
    if (req.session.workerEmail) {
        var result = true;
    } else {
        var result = false;
    }
    return result
}
const isAuthenticated = (req, res) => {
    if (req.session.email) {
        var result = true;
    } else {
        var result = false;
    }
    return result
};


io.on('connection', (socket) => {
    socket.on('chat message', msg => {
        io.emit('chat message', msg);
    });
});
io.sockets.on('connection', function (socket) {
    socket.on('create', function (room) {
        console.log('connected to ', room)
        socket.join(room);
    });
    socket.on('leave', function (room) {
        console.log('disconnected from ', room)
        socket.leave(room);
    })
}); 

app.route('/findMassages')
    .post(express.urlencoded({ extended: false }), async (req, res) => {
        /**!!!!!!! Уязвимость, в теории залогинившись на сайте можно получить все пароли через http запрос, 
         * надо исправить !!!!!!!!*/
        if (isAuthenticated(req, res) == true || isAuthenticatedWorker(req, res) == true) {
            findAllMessages(req.body.chatId)
                .then(result => {
                    if (result == false) {
                        res.sendStatus(501)
                    } else {
                        res.status(200);
                        res.send(result)
                    }
                });
        } else {
            res.sendStatus(401)
        }
    });

app.route('/newMessage')
    .post(express.urlencoded({ extended: false }), async (req, res) => {
        newMessage(req.body.chatId, req.body.messageContent, req.body.role)
            .then(result => {
                if (result == false) {
                    res.sendStatus(501)
                } else {
                    io.to(req.body.chatId).emit('message', req.body.messageContent, req.body.role);
                    res.sendStatus(200);
                }
            })
    });


app.route('/orderChats')
    .get(function (req, res) {
        res.status(200);
        res.sendFile(path.join(__dirname, 'specialist/ru/chatOrder.html'));
    })
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        var answer = ''
        await findChat(req.body.orderId, req.body.workerId, req.body.userId)
            .then(async (result) => {
                answer = result;
                if (result == false) {
                    await createNewChat(req.body.workerId, req.body.userId, req.body.orderId)
                        .then(chat => {
                            console.log(chat)
                            answer = chat;
                        })
                } 
            });
        if (answer == false) {
            res.sendStatus(501)
        } else {
            res.status(200);
            res.send(answer);
        }
    }); 

    
app.route('/userChats')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await findAllChats(req.body.orderId).then(result => {
            res.status(200);
            res.send(result)
        })
    })

app.route('/workers_reg')
    .get(function (req, res) {
        res.status(200);
        res.sendFile(path.join(__dirname, 'specialist/ru/workers_reg.html'));
    })
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        var str = req.body.services.split(',')
        await registerWorker(req.body.email, req.body.password, req.body.name, req.body.surname, req.body.phone, req.body.city, str)
            .then(result => {
                if (result == 'already exists') {
                    res.sendStatus(403);
                } else if (result == false) {
                    res.sendStatus(501);
                } else {
                    res.sendStatus(200);
                }
            });
    });
    



app.route('/workers_log')
    .get(function (req, res, next) {
        if (isAuthenticatedWorker(req, res) == true) {
            res.sendFile(path.join(__dirname, 'specialist/ru/workerCabinet.html'));

        } else {
            next();
        }
    })
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/ru/logWorker.html'));
    })
    .post(express.urlencoded({ extended: false }), async function (req, res, next) {
        const result = await loginWorker(req.body.email, req.body.password)
        if (result[0] == true) {
            var responseText = {
                workerId: result[1],
                workerName: result[2],
                workerPhone: result[3],
            }
            req.session.regenerate(function (err) {
                if (err) next(err)
                req.session.workerEmail = req.body.email
                req.session.save(function (err) {
                    if (err) return next(err);
                    res.status(200);
                    res.json(responseText);
                });

            });
        } else {
            res.status(401)
            res.send('неверно')
        }
    });


app.route('/login')
    .get(function (req, res, next) {
        if (isAuthenticated(req, res) == true) {
            res.sendFile(path.join(__dirname, 'specialist/ru/userCabinet.html'));
        } else {
            next();
        }
    })
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/ru/log.html'));
    })
    .post(express.urlencoded({ extended: false }), async function (req, res, next) {
        const result = await loginUser(req.body.email, req.body.password)
        if (result[0] == true) {
            var responseText = {
                userId: result[1],
                userName: result[2],
                userPhone: result[3],
            }
            req.session.regenerate(function (err) {
                if (err) next (err)
                req.session.email = req.body.email;
                req.session.save(function (err) {
                    if (err) return next(err);
                    
                    res.status(200);
                    res.json(responseText);
                });

            });
        } else {
            res.status(401)
            res.send('неверно')
        }
    });

app.post('/changeUser', express.urlencoded({ extended: false }), async function (req, res) {
    await changeUser(req.body.userId, req.body.columnName, req.body.value).then(result => {
        if (result == true) {
            res.sendStatus(200);
        } else {
            res.sendStatus(501);
        };
    });
});

app.get('/logout', function (req, res, next) {
    req.session.email = null;
    req.session.workerEmail = null;
    req.session.save(function (err) {
        if (err) next(err);
        req.session.regenerate(function (err) {
            if (err) next(err);
            res.redirect('/');
        });
    });
});


app.get('/deleteUser', async function (req, res) {
    await deleteUser(req.session.email)
        .then(result => {
            if (result == true) {
                req.session.email = null;
                res.status(200);
                res.redirect('/');
            } else {
                res.sendStatus(401);
            };
        });
});


app.get('/newOrder', (req, res) => {
    documentCheck = path.join(__dirname, 'specialist/ru/newOrder.html');
    res.status(200);
    res.sendFile(documentCheck);
});

app.route('/createOrder')
    .get(express.urlencoded({ extended: false }), function (req, res, next) {
        if (isAuthenticated(req, res) == true) {
            res.status(200);
            res.sendFile(path.join(__dirname, 'specialist/ru/newOrder.html'));
        } else {
            next();
        };
    })

    .get(function (req, res) {
        res.status(200);
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(path.join(__dirname, 'specialist/ru/log.html'));
    })
    .post(express.urlencoded({ extended: false }), function (req, res) {
        createNewOrder(req.body.userId, req.body.serviceId,
            req.body.description, req.body.distance, req.body.date, req.body.city)
            .then(result => {
                if (result == true) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(501);
                };
            });
    });


app.route('/userInfo')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await findUser(req.body.userId).then(result => {
            if (result == false) {
                res.sendStatus(501);
            } else {
                res.status(200);
                res.setHeader("Content-Type", "text/json");
                res.send(result.dataValues);
            }
        });
    });


app.route('/workerInfo')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await findWorker(req.body.workerId).then(result => {
            if (result == false) {
                res.sendStatus(501)
            } else {
                res.status(200);
                res.setHeader("Content-Type", "text/json")
                res.send(result)
            };
        });
    });

app.route('/userCabinetOrders')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        var result = await findOrderByUser(parseInt(req.body.userId));
        if (result['answer'] == false) {
            res.sendStatus(501)
        } else {
            res.status(200);
            res.send(result);
        }
    });

app.route('/findAllOrdersByUser')
    .get(function (req, res) {
        res.status(200);
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(path.join(__dirname, 'specialist/ru/usersOrders.html'));
    })
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await findAllOrdersByUser(parseInt(req.body.userId))
            .then(result => {
               
                res.status(200);
                res.send(result);
            });
    });
    
app.route('/orderPage')
    .get(async function (req, res) {
        res.status(200)
        res.setHeader('Content-Type', 'text/html')
        res.sendFile(path.join(__dirname, 'specialist/ru/orderPage.html'));
    })

app.route('/changeOrderStatus')
    .post(express.urlencoded({ extended: false }),  async function (req, res) {
        changeOrderStatus(req.body.orderId, req.body.status).then(result => {
            if (result == true) {
                res.sendStatus(200);
            } else {
                res.sendStatus(501)
            }
        })
    })

app.route('/workerCabinetServices')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        findServicesByWorker(req.body.workerId)
            .then(result => {
                if (result['answer'] === false) {
                    res.sendStatus(501);
                } else {
                    res.status(200);
                    res.send(result);
                };                
            });
    });

app.route('/getServiceName')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await getServiceName(req.body.serviceId).then(result => {
            if (result == false) {
                res.sendStatus(501);
            } else {
                res.status(200);
                res.send(result)
            };
        });
    });

app.route('/serviceMoreInfo')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await findServiceDetails(req.body.serviceId, req.body.workerId).then(result => {
            if (result['answer'] === false) {
                res.sendStatus(501);
            } else {
                res.status(200);
                res.send(result);
            };
        });
    });

app.route('/changeServiceWorker')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        changeServiceWorker(req.body.serviceId, req.body.workerId, req.body.price, req.body.distance, req.body.comment)
            .then(result => {
                if (result == false) {
                    res.sendStatus(501)
                } else {
                    res.sendStatus(200)
                }
            })
    })

app.route('/addServiceWorker')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        addServiceWorker(req.body.serviceId, req.body.workerId, req.body.price, req.body.distance, req.body.comment)
            .then(result => {
                if (result == false) {
                    res.sendStatus(501);
                } else {
                    res.sendStatus(200);
                }
            })
    });

app.route('/findAvailableOrders')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await findAvailableOrders(req.body.workerId).then(result => {
            if (result['answer'] == false) {
                res.sendStatus(501);
            } else {
                res.status(200);
                res.send(result)
            };
        });
    });
    
app.route('/availableChats')
    .get(async function (req, res) {
        res.status(200)
        res.setHeader('Content-Type', 'text/html')
        res.sendFile(path.join(__dirname, 'specialist/ru/availableChats.html'));
    })
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await findWorkersActiveChats(req.body.workerId).then(result => {
            if (result == false) {
                res.sendStatus(501)
            } else {
                res.status(200);
                res.send(result)
            }
        });    
    });

app.route('/availableOrders')
    .get(function (req, res) {
        res.status(200);
        res.sendFile(path.join(__dirname, 'specialist/ru/availableOrders.html'))
    })

app.route('/availableOrderDescription')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await orderDiscription(req.body.orderId).then(result => {
            if (result == false) {
                res.sendStatus(501)
            } else {
                res.status(200);
                res.send(result)
            }
        });
    });

app.route('/changeOrder')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        await changeOrder(req.body.orderId, req.body.description, req.body.distance, req.body.date)
            .then(result => {
                if (result == true) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(501);
                }
            });
    });



app.get('/deleteWorker', async function (req, res) {
    await deleteWorker(req.session.workerEmail)
    .then(result => {
        if (result == true) {
            req.session.workerEmail = null;
            res.status(200);
            res.redirect('/');
        } else {
            res.sendStatus(401);
        };
    });
});



app.route('/reg')
    .get(function (req, res) {
        res.status(200);
        res.sendFile(path.join(__dirname, 'specialist/ru/reg.html'));
    })
    .post(jsonParser, async function (req, res) {
        var answer = await registerUser(req.body.email, req.body.password);
        if (answer == true) {
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }

    });

app.get('/', (req, res) => {
    var documentCheck = path.join(__dirname, 'specialist/ru/home.html')
    res.status(200);
    res.sendFile(documentCheck);
});




app.post('/changeWorker', express.urlencoded({ extended: false }), async function (req, res) {
    await changeWorker(req.body.workerId, req.body.columnName, req.body.value)
        .then(result => {
            if (result == true) {
                res.sendStatus(200)
            }
            else {
                res.sendStatus(501)
            }
        })
    
})
 
app.get('/cities', (req, res) => {
    res.status(200);
    res.sendFile(path.join(__dirname, 'specialist/ru/values.json'));
});

app.get('/amountOfWorkers', (req, res) => {
    amountOfWorkers()
});

app.get('/profi', (req, res) => {
    res.status(200);
    res.sendFile(path.join(__dirname, 'specialist/profi.svg'));
});
app.get('/styles', function (req, res) {
    res.sendFile(path.join(__dirname, 'specialist/styles/styles.css'));
});
app.get('/styles/home', function (req, res) {
    res.sendFile(path.join(__dirname, 'specialist/styles/home.css'));
});

app.get('/services', function (req, res) {
    getServicesList().then(answer => {
        res.json(answer)
    })
})

app.route('/scripts/login')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/login.js'));
    });
app.route('/scripts/reg')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/registration.js'));
    });
app.route('/scripts/home')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/home.js'));
    });

app.route('/scripts/loginWorker')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/loginWorker.js'));
    });

app.route('/scripts/userCabinet')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/userCabinet.js'));
    });

app.route('/scripts/workerReg')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/workerReg.js'));
    });

app.route('/scripts/workerCabinet')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/workerCabinet.js'));
    });

app.route('/scripts/newOrder')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/newOrder.js'));
    });

app.route('/scripts/citySelect')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/citySelect.js'));
    });
app.route('/scripts/availableOrders')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/availableOrders.js'));
    });
app.route('/scripts/socket')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'node_modules/socket.io/client-dist/socket.io.js'));
    });
app.route('/scripts/chatOrder')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/chatOrder.js'));
    });
app.route('/scripts/orderPage')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/orderPage.js'));
    });
app.route('/scripts/upperMenuScripts')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/upperMenuScripts.js'));
    });
app.route('/scripts/usersOrders')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/usersOrders.js'));
    });
app.route('/scripts/availableChats')
    .get(function (req, res) {
        res.sendFile(path.join(__dirname, 'specialist/scripts/availableChats.js'));
    });

sqlConnect();