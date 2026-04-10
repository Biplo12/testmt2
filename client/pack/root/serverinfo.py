SERVER_NAME			= "Open MT2 Server"
SERVER_IP			= "localhost"
CH1_NAME			= "CH1"
PORT_1				= 13001
PORT_AUTH			= 11002
PORT_MARK			= 13001

STATE_NONE = "..."

STATE_DICT = {
	0 : "....",
	1 : "NORM",
	2 : "BUSY",
	3 : "FULL"
}

SERVER01_CHANNEL_DICT = {
	1:{"key":11,"name":CH1_NAME,"ip":SERVER_IP,"tcp_port":PORT_1,"udp_port":PORT_1,"state":STATE_NONE,},
}

REGION_NAME_DICT = {
	0 : "",
}

REGION_AUTH_SERVER_DICT = {
	0 : {
		1 : { "ip":SERVER_IP, "port":PORT_AUTH, },
	}
}

REGION_DICT = {
	0 : {
		1 : { "name" :SERVER_NAME, "channel" : SERVER01_CHANNEL_DICT, },
	},
}

MARKADDR_DICT = {
	10 : { "ip" : SERVER_IP, "tcp_port" : PORT_MARK, "mark" : "10.tga", "symbol_path" : "10", },
}
