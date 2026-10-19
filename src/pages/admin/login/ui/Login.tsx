// 운영자 로그인 (A-00-01): 고객 계정과 따로 관리한다
import { Button, Form, Input } from 'antd';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDB } from '@/shared/api';
import { catalogCss as s } from '@/shared/ui/admin';
import { adminLogin } from '@/features/admin-auth';

export default function Login() {
  const logged = useDB(x => x.admin.logged);
  const nav = useNavigate();
  if (logged) return <Navigate to="/admin" replace />;

  // 데모: 처음부터 채워 두고, 무엇을 넣어도 로그인된다
  const submit = () => {
    adminLogin();
    nav('/admin', { replace: true });
  };

  return (
    <div className={s.login}>
      <div className={s.loginCard}>
        <div className={s.loginLogo}><span className={s.mark}>ON</span>ON 관리자<span className="a-sid">A-00-01</span></div>
        <p className={s.loginDesc}>운영자 계정으로 로그인해요. 고객 계정과는 따로 관리해요.</p>
        <Form layout="vertical" requiredMark={false} initialValues={{ id: 'ops.park', pw: 'onadmin1' }} onFinish={submit}>
          <Form.Item label="아이디" name="id"><Input autoComplete="username" /></Form.Item>
          <Form.Item label="비밀번호" name="pw">
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" className={s.loginBtn}>로그인</Button>
        </Form>
        <Link to="/" className={s.loginBack}>고객 앱으로 가기</Link>
      </div>
    </div>
  );
}
