#!/bin/bash
sqlite3 ../khk-ssa/khk-access/db.sqlite "INSERT INTO apps (name, privilegeRequired, subdomain, icon) values (\"Agendas\", 0, \"agendas\", \"fa-newspaper-o\");"
