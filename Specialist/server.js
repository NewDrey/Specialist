import { sqlConnect, registerUser, loginUser, registerWorker, deleteWorker, deleteUser,
    getServicesList, loginWorker, createNewOrder, findOrderByUser, findServicesByWorker,
    findServiceDetails, changeServiceWorker, addServiceWorker, findAvailableOrders, orderDiscription,
    createNewChat, findChat, newMessage, findAllMessages, findAllChats, findUser, changeUser,
    changeWorker, findWorker, changeOrder, findAllOrdersByUser, changeOrderStatus, findWorkersActiveChats,
    getServiceName, userPersonalData, workerPersonalData, chatPersonalData, verifyUser, verifyWorker
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
import bcrypt from 'bcrypt'

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
    if (req.session.worker) {
        var result = true;
        console.log(req.session)
    } else {
        var result = false;
    }
    return result
}
const isAuthenticated = (req, res) => {
    if (req.session.user) {
        console.log(req.session)
        var result = true;
    } else {
        var result = false;
    }
    return result
};

const isAvailableDataUser = async (userId, req) => {
    var answer = ''
    await userPersonalData(userId).then(async (result) => {
        var emailBit = '';
        var passwordBit = '';
        await bcrypt.compare(result[0], req.session.user[0]).then(result => {
            emailBit = result
        })
        await bcrypt.compare(result[1], req.session.user[1]).then(result => {
            passwordBit = result
        })

        if (emailBit && passwordBit) {
            answer = true;
            return answer
        } else {
            answer = false;
            return answer
        }
    })
    return answer
};

const isAvailableDataWorker = async (workerId, req) => {
    var answer = ''
    await workerPersonalData(workerId).then(async (result) => {
        var emailBit = '';
        var passwordBit = '';
        await bcrypt.compare(result[0], req.session.worker[0]).then(async (result) => {
            emailBit = result
        })
        await bcrypt.compare(result[1], req.session.worker[1]).then(async (result) => {
            passwordBit = result
        })
        if (emailBit && passwordBit) {
            answer = true;
            return answer
        } else {
            answer = false;
            return answer
        }
    })
    return answer
}


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

app.route('/findMessages')

    .post(express.urlencoded({ extended: false }), async (req, res) => {
        var role = 0;
        if (req.session.user == undefined && req.session.worker == undefined) {
            console.log(1)
            res.sendStatus(401)
        } else if (req.session.worker != undefined) {
            role = 1
            await chatPersonalData(req.body.chatId, role).then(async (workerId) => {
                var access = ''
                await isAvailableDataWorker(workerId, req).then(async (result) => {
                    access = result
                    if (access) {
                        await findAllMessages(req.body.chatId)
                            .then(result => {
                                if (result == false) {
                                    res.sendStatus(501)
                                } else {
                                    console.log(2)
                                    res.status(200);
                                    res.send(result)
                                }
                            });
                    } else {
                        console.log(3)
                        res.sendStatus(401)
                    }
                });
            });
            
        } else if ((req.session.user != undefined)) {
            await chatPersonalData(req.body.chatId, role).then(async (userId) => {
                var access = '';
                await isAvailableDataUser(userId, req).then(async (result) => {
                    
                    access = result
                    if (access) {
                        await findAllMessages(req.body.chatId)
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
                })

                
            });
        }
    });


app.route('/newMessage')
    .post(express.urlencoded({ extended: false }), async (req, res) => {
        var role = 0;
        if (req.session.user == undefined && req.session.worker == undefined) {
            res.sendStatus(401)
        } else if (req.session.worker != undefined) {
            role = 1
            await chatPersonalData(req.body.chatId, role).then(async (workerId) => {
                var access = ''
                await isAvailableDataWorker(workerId, req).then(async (result) => {
                    access = result
                    if (access) {
                        await findAllMessages(req.body.chatId)
                            .then(result => {
                                if (result == false && typeof (result) != 'object') {
                                    res.sendStatus(501)
                                } else {
                                    newMessage(req.body.chatId, req.body.messageContent, req.body.role)
                                        .then(result => {
                                            if (result == false && result) {
                                                res.sendStatus(501)
                                            } else {
                                                io.to(req.body.chatId).emit('message', req.body.messageContent, req.body.role);
                                                res.sendStatus(200);
                                            }
                                        })
                                }
                            });
                    } else {
                        res.sendStatus(401)
                    }
                });
            });

        } else if ((req.session.user != undefined)) {
            await chatPersonalData(req.body.chatId, role).then(async (userId) => {
                var access = '';
                await isAvailableDataUser(userId, req).then(async (result) => {

                    access = result
                    if (access) {
                        await findAllMessages(req.body.chatId)
                            .then(result => {
                                if (result == false && typeof(result) != 'object') {
                                    res.sendStatus(501)
                                } else {
                                    res.status(200);
                                    newMessage(req.body.chatId, req.body.messageContent, req.body.role)
                                        .then(result => {
                                            if (result == false) {
                                                res.sendStatus(501)
                                            } else {
                                                io.to(req.body.chatId).emit('message', req.body.messageContent, req.body.role);
                                                res.sendStatus(200);
                                            }
                                        })
                                }
                            });
                    } else {
                        res.sendStatus(401)
                    }
                });
            });
        }
    });


app.route('/orderChats')
    .get(function (req, res) {
        res.status(200);
        res.sendFile(path.join(__dirname, 'specialist/ru/chatOrder.html'));
    })
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            var answer = ''
            await findChat(req.body.orderId, req.session.worker[2], req.body.userId)
                .then(async (result) => {
                    answer = result;
                    console.log(answer)
                    if (result == false) {
                        await createNewChat(req.session.worker[2], req.body.userId, req.body.orderId)
                            .then(chat => {
                                answer = chat;
                                if (answer == false) {
                                    res.sendStatus(501)
                                } else {
                                    res.status(200);
                                    res.send(answer);
                                }
                            })
                    } else {
                        res.status(200);
                        res.send(result)
                    }
                });
            
        }
    }); 

    
app.route('/userChats')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.user == undefined) {
            res.sendStatus(401)
        } else {
            await findAllChats(req.body.orderId, req.session.user[2]).then(result => {
                res.status(200);
                res.send(result)
            })
        }
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

        })
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
            req.session.regenerate(async function (err) {
                if (err) next(err)
                var hashWorker = []
                await bcrypt.hash(req.body.email, 10).then(answer => {
                    hashWorker.push(answer)
                });
                await bcrypt.hash(req.body.password, 10).then(answer => {
                    hashWorker.push(answer)
                    hashWorker.push(result[1])
                });

                req.session.worker = hashWorker
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
            req.session.regenerate(async function (err) {
                if (err) next(err)
                var hashUser = []
                await bcrypt.hash(req.body.email, 10).then(answer => {
                    hashUser.push(answer)
                });
                await bcrypt.hash(req.body.password, 10).then(answer => {
                    hashUser.push(answer)
                    hashUser.push(result[1])
                });

                req.session.user = hashUser
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
    if (req.session.user == undefined) {
        res.sendStatus(401)
    } else {
        await changeUser(req.session.user[2], req.body.columnName, req.body.value).then(result => {
            if (result == true) {
                res.sendStatus(200);
            } else {
                res.sendStatus(501);
            };
        });
    }
});

app.get('/logout', function (req, res, next) {
    req.session.user = null;
    req.session.worker = null;
    req.session.save(function (err) {
        if (err) next(err);
        req.session.regenerate(function (err) {
            if (err) next(err);
            res.redirect('/');
        });
    });
});


app.get('/deleteUser', async function (req, res) {
    if (req.session.user == undefined) {
        res.sendStatus(401)
    } else {
        await deleteUser(req.session.user[2])
            .then(result => {
                if (result == true) {
                    req.session.user = null;
                    res.status(200);
                    res.redirect('/');
                } else {
                    res.sendStatus(401);
                };
            });
    }
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
        createNewOrder(req.session.user[2], req.body.serviceId,
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
        if (req.session.user == undefined) {
            res.sendStatus(401)
        } else { 
            await findUser(req.session.user[2]).then(result => {
                if (result == false) {
                    res.sendStatus(501);
                } else {
                    res.status(200);
                    res.setHeader("Content-Type", "text/json");
                    res.send(result.dataValues);
                }
            });
        }
    });


app.route('/workerInfo')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else { 
            await findWorker(req.session.worker[2]).then(result => {
                if (result == false) {
                    res.sendStatus(501)
                } else {
                    res.status(200);
                    res.setHeader("Content-Type", "text/json")
                    res.send(result)
                };
            });
        }
    });

app.route('/userCabinetOrders')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.user == undefined) {
            res.sendStatus(401)
        } else {
            var result = await findOrderByUser(parseInt(req.session.user[2]));
            if (result['answer'] == false) {
                res.sendStatus(501)
            } else {
                res.status(200);
                res.send(result);
            }
        }
    });

app.route('/findAllOrdersByUser')
    .get(function (req, res) {
        if (req.session.user == undefined) {
            res.sendStatus(401)
        } else {
            res.status(200);
            res.setHeader('Content-Type', 'text/html');
            res.sendFile(path.join(__dirname, 'specialist/ru/usersOrders.html'));
        }
    })
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.user == undefined) {
            res.sendStatus(401)
        } else {
            await findAllOrdersByUser(parseInt(req.session.user[2]))
                .then(result => {
                    res.status(200);
                    res.send(result);
                });
        }
    });
    
app.route('/orderPage')
    .get(async function (req, res) {
        if (req.session.user == undefined) {
            res.sendStatus(401)
        } else {
            res.status(200)
            res.setHeader('Content-Type', 'text/html')
            res.sendFile(path.join(__dirname, 'specialist/ru/orderPage.html'));
        }
    })

app.route('/changeOrderStatus')
    .post(express.urlencoded({ extended: false }),  async function (req, res) {
        changeOrderStatus(req.body.orderId, req.session.user[2], req.body.status).then(result => {
            if (result == true) {
                res.sendStatus(200);
            } else {
                res.sendStatus(501)
            }
        })
    })

app.route('/workerCabinetServices')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            findServicesByWorker(req.session.worker[2])
                .then(result => {
                    if (result['answer'] === false) {
                        res.sendStatus(501);
                    } else {
                        res.status(200);
                        res.send(result);
                    };
                });
        }
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
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            await findServiceDetails(req.body.serviceId, req.session.worker[2]).then(result => {
                if (result['answer'] === false) {
                    res.sendStatus(501);
                } else {
                    res.status(200);
                    res.send(result);
                };
            });
        }
    });

app.route('/changeServiceWorker')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            changeServiceWorker(req.body.serviceId, req.session.worker[2], req.body.price, req.body.distance, req.body.comment)
                .then(result => {
                    if (result == false) {
                        res.sendStatus(501)
                    } else {
                        res.sendStatus(200)
                    }
                })
        }
    })

app.route('/addServiceWorker')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            addServiceWorker(req.body.serviceId, req.session.worker[2], req.body.price, req.body.distance, req.body.comment)
                .then(result => {
                    if (result == false) {
                        res.sendStatus(501);
                    } else {
                        res.sendStatus(200);
                    }
                })
        }
    });

app.route('/findAvailableOrders')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            await findAvailableOrders(req.session.worker[2]).then(result => {
                if (result['answer'] == false) {
                    res.sendStatus(501);
                } else {
                    res.status(200);
                    res.send(result)
                };
            });
        }
    });
    
app.route('/availableChats')
    .get(async function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            res.status(200)
            res.setHeader('Content-Type', 'text/html')
            res.sendFile(path.join(__dirname, 'specialist/ru/availableChats.html'));
        }
    })
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            await findWorkersActiveChats(req.session.worker[2]).then(result => {
                if (result == false) {
                    res.sendStatus(501)
                } else {
                    res.status(200);
                    res.send(result)
                }
            });
        }
    });

app.route('/availableOrders')
    .get(function (req, res) {
        if (req.session.worker == undefined) {
            res.sendStatus(401)
        } else {
            res.status(200);
            res.sendFile(path.join(__dirname, 'specialist/ru/availableOrders.html'))
        }
    });

app.route('/availableOrderDescription')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.worker == undefined && req.session.user == undefined) {
            
            res.sendStatus(401)
        } else {
            await orderDiscription(req.body.orderId).then(result => {
                if (result == false) {
                    res.sendStatus(501)
                } else {
                    res.status(200);
                    res.send(result)
                }
            });
        }
    });

app.route('/changeOrder')
    .post(express.urlencoded({ extended: false }), async function (req, res) {
        if (req.session.user == undefined) {
            res.sendStatus(401)
        } else {
            await changeOrder(req.body.orderId, req.session.user[2], req.body.description, req.body.distance, req.body.date)
                .then(result => {
                    if (result == true) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(501);
                    }
                });
        }
    });



app.get('/deleteWorker', async function (req, res) {
    if (req.session.worker == undefined) {
        res.sendStatus(401)
    } else {
        await deleteWorker(req.session.worker[2])
            .then(result => {
                if (result == true) {
                    req.session.worker = null;
                    res.status(200);
                    res.redirect('/');
                } else {
                    res.sendStatus(401);
                };
            });
    }
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
    if (req.session.user == undefined) {
        res.sendStatus(401)
    } else {
        await changeWorker(req.body.workerId, req.body.columnName, req.body.value)

            .then(result => {
                if (result == true) {
                    res.sendStatus(200)
                }
                else {
                    res.sendStatus(501)
                }
            })
    }
    
})

app.get('/confirmationUser/:token', async (req, res) => {

    await verifyUser(req.params.token).then(result => {
        if (result == true) {
            res.redirect('/login')
        } else {
            res.sendStatus(500)
        }
    })
})

app.get('/confirmationWorker/:token', async (req, res) => {
    await verifyWorker(req.params.token).then(result => {
        if (result == true) {
            res.redirect('/workers_log')
        } else {
            res.sendStatus(500)
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