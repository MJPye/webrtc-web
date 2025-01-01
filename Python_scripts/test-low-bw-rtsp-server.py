import gi
gi.require_version('Gst', '1.0')
gi.require_version('GstRtspServer', '1.0')
from gi.repository import Gst, GstRtspServer, GObject

Gst.init(None)

class MyFactory(GstRtspServer.RTSPMediaFactory):
    def __init__(self):
        GstRtspServer.RTSPMediaFactory.__init__(self)

    def do_create_element(self, url):
        pipeline_str = (
          "v4l2src device=/dev/video0 ! "
          "video/x-raw,width=640,height=480,framerate=30/1 ! "
          "videoconvert ! queue max-size-buffers=1 ! video/x-raw,format=I420 ! x264enc speed-preset=ultrafast tune=zerolatency threads=1 key-int-max=15 ! "
          "video/x-h264,profile=constrained-baseline ! "
          "queue max-size-time=100000000 ! h264parse ! "
          "rtph264pay config-interval=1 name=pay0 pt=96"
	)
        return Gst.parse_launch(pipeline_str)

class GstServer:
    def __init__(self):
        self.server = GstRtspServer.RTSPServer()
        self.server.props.service = "8554"
        self.factory = MyFactory()
        self.factory.set_shared(True)
        self.mount_points = self.server.get_mount_points()
        self.mount_points.add_factory("/test", self.factory)
        self.server.attach(None)
        print("RTSP stream ready at rtsp://<RaspberryPi_IP>:8554/test")

if __name__ == '__main__':
    GObject.threads_init()
    GstServer()
    loop = GObject.MainLoop()
    loop.run()